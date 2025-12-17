import { Request, Response } from 'express';
import DiscountRepository from '../repository/discount.repository';
import * as discountService from '../service/discount.service';

const discountRepo = new DiscountRepository();

export const getDiscountDetails = async (req: Request, res: Response) => {
  try {
    const { data, success, errors } = await discountService.fetchDiscount(
      req.body,
    );

    if (!success)
      return res.status(500).json({
        success: false,
        errors: errors,
      });

    const discount = data[0]?.discount;
    console.log(discount);

    const details = discountRepo.getFullDetailsByType(discount);

    return res.json({
      success: true,
      data: details,
    });
  } catch (err: any) {
    console.error('getDiscountDetails Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
};
