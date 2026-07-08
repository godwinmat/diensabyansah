"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    hasCart: boolean;
    cartUpdatedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

function formatDate(iso: string | null) {
    if (!iso) return "-";

    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function UsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
    return (
        <Card className="gap-0 py-0 hover:translate-y-0">
            <CardHeader className="border-b py-4">
                <CardTitle className="text-sm text-muted-foreground">
                    {initialUsers.length} user
                    {initialUsers.length !== 1 ? "s" : ""}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cart</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialUsers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No users yet.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {initialUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="max-w-[220px] truncate font-medium">
                                    {user.name}
                                </TableCell>
                                <TableCell className="max-w-[260px] truncate font-mono text-xs text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {user.hasCart ? (
                                            <Badge variant="secondary">Active</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                        {user.cartUpdatedAt ? (
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(user.cartUpdatedAt)}
                                            </span>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(user.updatedAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
