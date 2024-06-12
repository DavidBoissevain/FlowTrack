"use client"

import { Card } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd"
import { useCardModal } from "@/hooks/use-card-modal";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface CardItemProps {
    data: Card;
    index: number;
}

export const CardItem = ({
    data,
    index,
}: CardItemProps) => {

    const cardModal = useCardModal();


    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    role="button"
                    onClick={() => cardModal.onOpen(data.id)}
                    className="truncate border-2 border-transparant hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm">
                    <div>{data.title}</div>
                    {data.userName && (
                        <div className="mt-3 flex items-center gap-2 text-gray-500 text-xs">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={data.userImage!} />
                            </Avatar>
                            <span>{data.userName}</span>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};