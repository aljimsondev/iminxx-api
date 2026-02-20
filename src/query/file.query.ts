export const STAGE_UPLOAD_CREATE_QUERY = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}`;

export const FILE_CREATE_QUERY = `mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      id
      fileStatus
      alt
      createdAt
      ... on MediaImage {
        image {
          width
          height
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
