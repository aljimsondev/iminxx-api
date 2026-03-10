import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  FILE_CREATE_QUERY,
  STAGE_UPLOAD_CREATE_QUERY,
} from '../query/file.query';
import {
  FileCreateInput,
  FileCreateInputDuplicateResolutionMode,
  ImageReturnType,
  StagedMediaUploadTarget,
  StagedUploadInput,
  StagedUploadTargetGenerateUploadResource,
} from '../types/file';
import { FileParser } from '../utils/parser/file-parser';

export class FileRepository {
  private async stageUploadCreate(stageUploadInputs: StagedUploadInput[]) {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: STAGE_UPLOAD_CREATE_QUERY,
        variables: {
          input: stageUploadInputs,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    if (data?.errors?.length > 0) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    const stagedUploadsCreate = data?.data?.stagedUploadsCreate;

    if (stagedUploadsCreate?.userErrors?.length > 0) {
      return {
        success: false,
        errors: stagedUploadsCreate.userErrors,
      };
    }

    return {
      success: true,
      data: stagedUploadsCreate?.stagedTargets[0] as StagedMediaUploadTarget,
    };
  }

  async uploadBase64({
    base64,
    filename,
    mimetype,
    resource = StagedUploadTargetGenerateUploadResource.IMAGE,
    duplicateResolutionMode = 'APPEND_UUID',
  }: {
    base64: string;
    filename: string;
    mimetype?: string;
    resource?: StagedUploadTargetGenerateUploadResource;
    duplicateResolutionMode?: FileCreateInputDuplicateResolutionMode;
  }) {
    try {
      const _mimetype =
        mimetype || base64.split(';')[0]?.split(':')[1] || 'image/jpeg';

      const { success, data, errors } = await this.stageUploadCreate([
        {
          filename: filename,
          mimeType: _mimetype,
          resource: resource,
        },
      ]);

      if (!success) {
        return {
          success: false,
          errors,
        };
      }

      const file = new FileParser().base64ToFile({
        base64,
        filename,
        mimeType: _mimetype,
      });

      if (!data) throw new Error('stagedTargets not found!');

      const resourceUrl = await this.uploadFile({
        file: file,
        stagedTargets: data,
      });

      const {
        success: fileCreated,
        data: createdFile,
        errors: createFileErrors,
      } = await this.createFile([
        {
          originalSource: resourceUrl,
          filename: filename,
          duplicateResolutionMode: duplicateResolutionMode,
          contentType: 'IMAGE',
        },
      ]);

      if (!fileCreated) {
        return {
          success: false,
          errors: createFileErrors,
        };
      }

      return {
        success: true,
        data: createdFile as ImageReturnType,
      };
    } catch (e: any) {
      return {
        success: false,
        errors: e?.message || e,
      };
    }
  }

  private async uploadFile({
    file,
    stagedTargets,
  }: {
    file: File;
    stagedTargets: StagedMediaUploadTarget;
  }) {
    const { resourceUrl, url } = stagedTargets;

    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return resourceUrl;
  }

  private async createFile(files: FileCreateInput[]) {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: FILE_CREATE_QUERY,
        variables: {
          files,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data;

    if (data?.errors?.length > 0) {
      return {
        success: false,
        errors: data.errors,
      };
    }

    const fileCreate = data?.data?.fileCreate;

    if (fileCreate?.userErrors?.length > 0) {
      return {
        success: false,
        errors: fileCreate.userErrors,
      };
    }

    return {
      success: true,
      data: fileCreate?.files[0],
    };
  }
}
