import { useCustomerAuth, AddressItem, CustomerUser } from "./useCustomerAuth";

export type { AddressItem, CustomerUser as User };
export { useCustomerAuth as useAuth };
export default useCustomerAuth;
