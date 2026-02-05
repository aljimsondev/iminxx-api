import CustomerRepository from '../repository/customer.repository';
import { Address, UpdateCustomerData } from '../types/customer';

const customerRepo = new CustomerRepository();

export const update = async (
  customerId: string,
  payload: Partial<UpdateCustomerData>,
) => {
  const data = await customerRepo.update(customerId, payload);

  return data;
};

export const updateAddress = async ({
  addressId,
  customerId,
  payload,
}: {
  customerId: string;
  addressId: string;
  payload: Partial<Address>;
}) => {
  return await customerRepo.updateAddress({
    addressId,
    customerId,
    payload,
  });
};

export const getBirthdate = async (customerId: string) => {
  const data = await customerRepo.getCustomerBirthdate(customerId);

  return data;
};

export const setWishlistedItem = async ({
  customerId,
  productId,
  action,
}: {
  customerId: string;
  productId: string;
  action: 'remove' | 'add';
}) =>
  await customerRepo.setWishlistedItem({
    customerId,
    productId,
    action,
  });

export const syncWishlistedItem = async ({
  customerId,
  productIds,
}: {
  customerId: string;
  productIds: string[];
}) =>
  await customerRepo.syncWishlistedItem({
    customerId,
    productIds,
  });
