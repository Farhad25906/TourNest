import CreateTourForm from "@/components/module/Tour/create-tour-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function CreateTourPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Tour</CardTitle>
                        <CardDescription>
                            Fill in the details below to create a new tour. Fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateTourForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}