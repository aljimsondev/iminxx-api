import { Request, Response } from 'express';
import * as customerService from '../service/customer.service';
import {
  addressSchema,
  updateCustomerSchema,
  wishlistItemSchema,
} from '../types/customer';

export const getCustomerBithdate = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customer_id;

    const { data, success, errors } =
      await customerService.getBirthdate(customerId);

    if (!success)
      return res.status(500).json({
        success: false,
        errors: errors,
      });

    return res.json({
      success: true,
      data: data,
    });
  } catch (err: any) {
    console.error('getCustomerBithdate Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const body = await req.body;

    // validate input from request body
    const { success, data, error } = updateCustomerSchema
      .partial()
      .safeParse(body);

    if (!success) {
      return res.json({
        success: false,
        error: JSON.parse(error?.message),
      });
    }

    // process updates
    const {
      success: updated,
      data: updateData,
      error: updateError,
    } = await customerService.update(req.params.customer_id, data);

    if (!updated)
      return res.json({
        success: updated,
        error: updateError,
      });

    return res.json({
      success: updated,
      data: updateData,
    });
  } catch (err: any) {
    console.error('update Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const body = await req.body;
    // validate input from request body
    const { success, data, error } = addressSchema.partial().safeParse(body);

    if (!success) {
      return res.json({
        success: false,
        error: JSON.parse(error?.message),
      });
    }

    // process address updates
    const {
      success: updated,
      data: updateData,
      error: updateError,
    } = await customerService.updateAddress({
      addressId: req.params.address_id,
      customerId: req.params.customer_id,
      payload: data,
    });

    if (!updated)
      return res.json({
        success: updated,
        error: updateError,
      });

    return res.json({
      success: updated,
      data: updateData,
    });
  } catch (err: any) {
    console.error('updateAddress Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};

export const setWishlistedItem = async (req: Request, res: Response) => {
  try {
    const body = await req.body;

    if (!body?.productId) throw new Error('Product ID is required!');

    const {
      success: parsingSuccess,
      data: productId,
      error,
    } = wishlistItemSchema.safeParse(body.productId);

    // return zod validation
    if (!parsingSuccess) {
      return res.json({
        success: false,
        error: JSON.parse(error?.message),
      });
    }

    const {
      error: wishlistError,
      success,
      data,
    } = await customerService.setWishlistedItem({
      customerId: req.params.customer_id,
      productId,
      action: body?.action || 'add',
    });

    if (!success) {
      return res.json({
        success: false,
        error: wishlistError,
      });
    }

    return res.json({ success: success, data });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
