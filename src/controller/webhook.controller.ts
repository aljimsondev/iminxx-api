import { Request, Response } from 'express';
import CustomerRepository from '../repository/customer.repository';
import { redisRepository } from '../repository/redis.repository';
import { NewCustomer } from '../types/customer';

const customerRepo = new CustomerRepository();

export const customerUpdateWebhook = async (req: Request, res: Response) => {
  const body = req.body;

  if (body) {
    /**
     * STATES
     * invited - the activation link was sent to the user
     * enabled - the user activated the account
     */

    const state = body.state as string;

    // enabled state customer update
    if (state.toLowerCase() === 'enabled') {
      const email = body.email;
      const id = body.admin_graphql_api_id;
      const cacheKey = `customer:${email}`;

      // retrieved customer info to redis
      const customerCachedInfo = (await redisRepository.get(
        cacheKey,
      )) as Partial<NewCustomer>;

      if (customerCachedInfo) {
        // proceed updates
        console.log('[WEBHOOK] Processing account activation webhook...');
        console.log('[WEBHOOK] Updating customer data!');

        const result = await customerRepo.update(id, {
          firstName: customerCachedInfo.firstName,
          lastName: customerCachedInfo.lastName,
          phone: customerCachedInfo?.phone,
        });

        if (result.success) {
          console.log('[WEBHOOK] Updating customer success!');
          // delete cache to free some space
          await redisRepository.delete(cacheKey);
        } else {
          console.log(
            '[WEBHOOK] Updating customer failed! Reason: ' +
              JSON.stringify(result.error, null, 2),
          );
        }
      }
    }
  }

  return res.json({
    success: true,
    data: 'ok',
  });
};
