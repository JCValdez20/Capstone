import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Edit,
  Trash2,
  Key,
  Users,
  Mail,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import adminService from "@/services/adminService";
import { format } from "date-fns";

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllStaff();
      console.log("Staff API Response:", response); // Debug log
      setStaffMembers(response.staff || response.data?.staff || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await adminService.createStaffAccount(formData);
      toast.success("Staff account created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ first_name: "", last_name: "", email: "", password: "" });
      fetchStaffMembers();
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to create staff account"
      );
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();

    if (
      !selectedStaff ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await adminService.updateStaffAccount(selectedStaff._id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });
      toast.success("Staff account updated successfully");
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({ first_name: "", last_name: "", email: "", password: "" });
      fetchStaffMembers();
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to update staff account"
      );
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await adminService.deleteStaffAccount(staffId);
      toast.success("Staff account deleted successfully");
      fetchStaffMembers();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete staff account"
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (resetPasswordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await adminService.resetStaffPassword(selectedStaff._id, {
        newPassword: resetPasswordData.newPassword,
      });
      toast.success("Staff password reset successfully");
      setIsResetPasswordDialogOpen(false);
      setSelectedStaff(null);
      setResetPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset staff password"
      );
    }
  };

  const openEditDialog = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (staff) => {
    setSelectedStaff(staff);
    setResetPasswordData({ newPassword: "", confirmPassword: "" });
    setIsResetPasswordDialogOpen(true);
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const generateRandomPasswordForReset = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetPasswordData({
      newPassword: password,
      confirmPassword: password,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff accounts and permissions</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Staff Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomPassword}
                    className="px-3"
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Staff will be asked to change this on first login
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Create Staff Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staffMembers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Staff
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    staffMembers.filter((staff) => staff.isActive !== false)
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Recent Additions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    staffMembers.filter(
                      (staff) =>
                        staff.createdAt &&
                        !isNaN(new Date(staff.createdAt)) &&
                        new Date(staff.createdAt) >
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Staff Members
              </h3>
              <p className="text-gray-600">
                Get started by creating your first staff account.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium">
                      {staff.first_name} {staff.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {staff.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Staff
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staff.isActive !== false ? "default" : "secondary"
                        }
                        className={
                          staff.isActive !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {staff.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staff.createdAt && !isNaN(new Date(staff.createdAt))
                        ? format(new Date(staff.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(staff)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetPasswordDialog(staff)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Staff Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                {staff.first_name} {staff.last_name}'s account?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStaff(staff._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Update Staff Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Staff Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="new_password"
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPasswordForReset}
                  className="px-3"
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-gray-500">
              The staff member will receive the new password via email and will
              be asked to change it on next login.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResetPasswordDialogOpen(false);
                  setSelectedStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
