"use client"

import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd"

import { ListWithCards } from "@/types";
import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";

interface ListContainerProps {
    data: ListWithCards[];
    boardId: string;
};

function reorder<T>(list: T[], startindex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startindex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const ListContainer = ({
    data,
    boardId
}: ListContainerProps) => {

    const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
        onSuccess: () => {
            toast.success("List reordered.");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: () => {
            toast.success("Card reordered.");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const [orderedData, setOrderedData] = useState(data);

    useEffect(() => {
        setOrderedData(data);
    }, [data]);

    const onDragEnd = (result: any) => {
        const { destination, source, type } = result;

        if (!destination) {
            return;
        }

        // if dropped in the same position
        if (
            destination.dropppaleId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // User moves a list
        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index,
            ).map((item, index) => ({ ...item, order: index }));

            setOrderedData(items);

            // Execute Server Action
            executeUpdateListOrder({ items, boardId });

        }

        // User moves a card
        if (type === "card") {
            let newOrderedData = [...orderedData];

            // Source and destination list
            const sourceList = newOrderedData.find(list => list.id === source.droppableId);
            const destList = newOrderedData.find(list => list.id === destination.droppableId);

            if (!sourceList || !destList) {
                return;
            }

            // Check if cards exists on source list
            if (!sourceList.cards) {
                sourceList.cards = [];
            }

            // Check if cards exists on the destList
            if (!destList.cards) {
                destList.cards = [];
            }

            // Moving the card in the same list
            if (source.droppableId === destination.droppableId) {
                const reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index
                );

                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                sourceList.cards = reorderedCards;

                setOrderedData(newOrderedData);

                // Execute Server Action
                executeUpdateCardOrder({
                    boardId: boardId,
                    items: reorderedCards
                });

                // User moves card to another list
            } else {
                // Remove card from source list
                const [movedCard] = sourceList.cards.splice(source.index, 1);

                // Assign the new listId to the moved card
                movedCard.listId = destination.droppableId;

                // Add card to destination list
                destList.cards.splice(destination.index, 0, movedCard);

                // Update order of the cards in source list
                sourceList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                // Update order of the cards in destination list
                destList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);

                // Execute Server Action
                executeUpdateCardOrder({
                    boardId: boardId,
                    items: destList.cards
                });
            }
        }
    }


    return (
        <DragDropContext
            onDragEnd={onDragEnd}
        >
            <Droppable droppableId="lists" type="list" direction="horizontal">
                {(provided) => (
                    <ol
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-x-3 h-full"
                    >
                        {orderedData.map((list, index) => {
                            return (
                                <ListItem
                                    key={list.id}
                                    index={index}
                                    data={list}
                                />
                            )
                        })}
                        {provided.placeholder}
                        <ListForm />
                        <div className="flex-shrink-0 w-1" />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    )
}