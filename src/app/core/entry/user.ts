import {Advertiser} from "./advertiser";

export interface User {
  user_id: number;
  user_name: string;
  mobile: string;
  email: string;
  company_id: number;
  user_status: string;
  role_id: number;
  company_status: number;
  company_type: number;
  user_list?: User[];
  ad_list?: Advertiser[];
  login_type?: number;
  show_summary?:number;
  company_pub_account_num?:number;
  cdp_company_id: string;
  cdp_company_user_id:string;
  menuData:Object;
}
