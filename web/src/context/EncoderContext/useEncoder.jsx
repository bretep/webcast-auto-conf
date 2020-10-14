import {useEncoderContext} from "./index";

export const useEncoder = () => {

    const {encoderState, reboot} = useEncoderContext()


    return {
        ...encoderState,
        reboot
    }
}