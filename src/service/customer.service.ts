import CustomerRepository from '../repository/customer.repository';
import { UpdateCustomerData } from '../types/customer';

const customerRepo = new CustomerRepository();

export const update = async (
  customerId: string,
  payload: Partial<UpdateCustomerData>,
) => {
  const data = await customerRepo.update(customerId, payload);

  return data;
};

export const getBirthdate = async (customerId: string) => {
  const data = await customerRepo.getCustomerBirthdate(customerId);

  return data;
};
