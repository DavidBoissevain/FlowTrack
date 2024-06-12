import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { OrganizationMembership } from '@clerk/nextjs/server';
import { updateCard } from '@/actions/update-card';
import { useAction } from '@/hooks/use-action';
import { CardWithList } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { UserRound } from 'lucide-react';

interface AssignedToProps {
    usersData: OrganizationMembership[];
    data: CardWithList;
}

export const AssignedTo = ({
    usersData,
    data
}: AssignedToProps) => {
    const params = useParams();
    const queryClient = useQueryClient();

    const [selectedUserImage, setSelectedUserImage] = useState(data.userImage || "");
    const [selectedUserName, setSelectedUserName] = useState(data.userName || "");
    const [selectedUserId, setSelectedUserId] = useState(data.userId || "");
    const [loading, setLoading] = useState(false);

    const { execute } = useAction(updateCard, {
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["card", data.id] });
            queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
            toast.success(`Card "${data.title}" updated.`);
            setLoading(false);
        },
        onError: (error) => {
            toast.error("An error occurred");
            setLoading(false);
        },
    });

    const onSubmit = (userId: string) => {
        if (userId === selectedUserId) {
            return;
        }

        const selectedUser = usersData.find(user => user.id === userId);
        if (!selectedUser) {
            toast.error("User not found.");
            return;
        }

        const userName = `${selectedUser.publicUserData?.firstName || ''} ${selectedUser.publicUserData?.lastName || ''}`.trim();
        const userImage = selectedUser.publicUserData?.imageUrl;

        if (!userName || !userImage) {
            toast.error("User information is incomplete.");
            return;
        }

        const boardId = params.boardId as string;
        setLoading(true);

        execute({
            id: data.id,
            boardId,
            userId,
            userName,
            userImage
        });

        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setSelectedUserImage(userImage);
    }

    return (
        <div className="font-semibold">
            <div className='flex items-start gap-x-3'>
                <UserRound className="h-5 w-5 mt-0.5 text-neutral-700" />
                <p className="font-semibold text-neutral-700 mb-0.5">
                    Assigned To
                </p>
            </div>
            <div className="mt-2 mb-4">
                <Select onValueChange={onSubmit}>
                    <SelectTrigger className="w-[280px]">
                        {selectedUserId ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedUserImage} />
                                </Avatar>
                                <span>{selectedUserName}</span>
                            </div>
                        ) : (
                            <SelectValue placeholder="Select User" />
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {usersData.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.publicUserData?.imageUrl} />
                                    </Avatar>
                                    <span>{`${user.publicUserData?.firstName || ''} ${user.publicUserData?.lastName || ''}`.trim()}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div >
    );
};

AssignedTo.Skeleton = function AssignedToSkeleton() {
    return (
        <div className="flex items-start gap-x-3 mb-6">
            <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
        </div>
    );
};
