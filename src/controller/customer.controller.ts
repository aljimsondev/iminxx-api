import { Request, Response } from 'express';
import * as customerService from '../service/customer.service';
import { updateCustomerSchema } from '../types/customer';

export const getCustomerBithdate = async (req: Request, res: Response) => {
  try {
    const { data, success, errors } = await customerService.getBirthdate(
      req.params.customer_id,
    );

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
