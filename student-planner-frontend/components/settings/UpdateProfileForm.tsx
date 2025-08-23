/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { updateUserSuccess } from "@/redux/slices/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputs = { username: string; };

export function UpdateProfileForm() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormInputs>({
    defaultValues: { username: user?.username || '' }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/updatedetails`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const updatedUser = await res.json();
      if (!res.ok) throw new Error(updatedUser.message || "Failed to update profile");
      
      dispatch(updateUserSuccess({ user: updatedUser }));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} disabled={isSubmitting} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}