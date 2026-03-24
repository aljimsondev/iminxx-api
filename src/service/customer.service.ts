import CustomerRepository from '../repository/customer.repository';
import { Address, NewCustomer, UpdateCustomerData } from '../types/customer';

const customerRepo = new CustomerRepository();

export const update = async (
  customerId: string,
  payload: Partial<UpdateCustomerData>,
) => {
  const data = await customerRepo.update(customerId, payload);

  return data;
};

export const updatePassword = async ({
  accessToken,
  password,
}: {
  password: string;
  accessToken: string;
}) => {
  return await customerRepo.updateUserPassword({ accessToken, password });
};

export const generateAccessToken = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return await customerRepo.generateAccessToken({ email, password });
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

export const signup = async (customer: NewCustomer) =>
  await customerRepo.signup(customer);

export const sendPasswordResetLink = async ({
  email,
  customerIpAddress,
}: {
  email: string;
  customerIpAddress: string;
}) => await customerRepo.sendPasswordResetLink({ customerIpAddress, email });

export const resetPasswordByURL = async (params: {
  url: string;
  password: string;
}) => await customerRepo.resetPasswordByURL(params);
