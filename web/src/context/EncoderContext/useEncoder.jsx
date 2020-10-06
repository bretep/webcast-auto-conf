import {useEncoderContext} from "./index";

export const useEncoder = () => {
    const { encoderState } = useEncoderContext()
    return {
        ...encoderState
    }
}