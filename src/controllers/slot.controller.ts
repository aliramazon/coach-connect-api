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

const getAll = catchAsync(async (req, res) => {
    const { effectiveUser } = req;
    const slots = await slotService.getAll(effectiveUser?.id!);

    res.status(200).json({
        success: true,
        message: 'Success',
        data: { slots },
    });
});

export const slotController = {
    create,
    getAll,
};
