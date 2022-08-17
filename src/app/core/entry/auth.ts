import { User } from './user';
import { Err } from './err';

export interface Auth {
  user?: User;
  userId?: string;
  isLogin: boolean;
  isSuccess: boolean;
  isFailure: boolean;
  failureMsg?: string;
  msgFailureMsg?: string;
}
