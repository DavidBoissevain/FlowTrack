import { auth, clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';


export async function GET(
    request: Request,
    { params }: { params: { cardId: string } }
) {
    try {
        const { userId, orgId: organizationId } = auth();

        if (!userId || !organizationId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const users = await clerkClient.organizations.getOrganizationMembershipList({ organizationId });

        return NextResponse.json(users);

    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}