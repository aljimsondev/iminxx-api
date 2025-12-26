import { Request, Response } from 'express';
import * as productService from '../service/product.service';

export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { data, success, errors } = await productService.getDetails({
      product_id: req.params.product_id,
    });

    if (!success)
      return res.status(500).json({
        success: false,
        errors: errors,
      });

    console.log(data);

    return res.json({
      success: true,
      data: data,
    });
  } catch (err: any) {
    console.error('getProductDetails Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
