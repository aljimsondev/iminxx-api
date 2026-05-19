import { Request, Response } from 'express';
import * as customerService from '../service/customer.service';
import { newCustomerSchema } from '../types/customer';

export const signupV2 = async (req: Request, res: Response) => {
  try {
    const body = await req.body;

    const {
      success: parseSuccess,
      data: customerInput,
      error: validationErrors,
    } = newCustomerSchema.safeParse(body);

    if (!parseSuccess) {
      const parsedErrors = JSON.parse(validationErrors as any) as any[];

      const zodErrors = parsedErrors.map((zodError) => ({
        message: zodError?.message,
        code: zodError?.code,
        path: zodError?.path,
      }));

      return res.json({
        success: false,
        error: zodErrors,
      });
    }

    const result = await customerService.signupV2(customerInput);

    return res.json(result);

    // if (!result.success) {
    //   return res.json({ success: false, error: result?.error });
    // }

    // return res.json({ success: true, data: result?.data });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
