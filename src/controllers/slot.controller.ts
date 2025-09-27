import { slotService } from '../services/slot.service';
import { catchAsync } from '../utils/catch-async';

const create = catchAsync(async (req, res) => {
    const { effectiveUser, body } = req;
    const slot = await slotService.create(effectiveUser?.id!, body);
    res.status(200).json({
        success: true,
        message: 'Slot successfully created',
        data: slot,
    });
});

export const slotController = {
    create,
};
