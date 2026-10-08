import {
  useCustomerAuth,
  AddressItem,
  CustomerUser,
  CustomerOrder,
  CustomerOrderItem,
} from "./useCustomerAuth";

export type {
  AddressItem,
  CustomerUser,
  CustomerUser as User,
  CustomerOrder,
  CustomerOrderItem,
};
export { useCustomerAuth as useAuth };
export default useCustomerAuth;
