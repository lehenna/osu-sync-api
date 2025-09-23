import type { User } from '../user/user.schema';
import type { Device } from '../device/device.schema';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            device?: Device;
        }
    }
}
