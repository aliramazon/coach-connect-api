// service
import { Prisma, SlotStatus } from '../generated/prisma';
import { prisma } from '../prisma';
import { CustomError } from '../utils/custom-error';

const create = async (
    coachId: string,
    data: Omit<Prisma.SlotCreateInput, 'coach' | 'status'>,
) => {
    const safeData = {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
    };

    if (safeData.startTime >= safeData.endTime) {
        throw CustomError.badRequest('Start time must be before end time');
    }

    const overlappingSlot = await prisma.slot.findFirst({
        where: {
            coachId,
            startTime: { lt: safeData.endTime },
            endTime: { gt: safeData.startTime },
        },
    });

    if (overlappingSlot) {
        throw CustomError.conflict('This slot overlaps with an existing slot');
    }

    const slot = await prisma.slot.create({
        data: {
            ...safeData,
            coach: {
                connect: { id: coachId },
            },
            status: SlotStatus.AVAILABLE,
        },
    });

    return slot;
};

export const slotService = { create };
