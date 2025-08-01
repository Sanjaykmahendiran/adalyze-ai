"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("edit-profile")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")

  return (
    <div className=" mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Tabs defaultValue="edit-profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#121212] mb-6">
          <TabsTrigger
            value="edit-profile"
            className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
          >
            Edit Profile
          </TabsTrigger>
          <TabsTrigger
            value="change-password"
            className="data-[state=active]:bg-primary flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
          >
            Change Password
          </TabsTrigger>
        </TabsList>


        {/* Edit Profile Tab */}
        <TabsContent value="edit-profile">
          <Card className="rounded-2xl w-full p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Edit Profile</h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-[#121212] border-[#2b2b2b]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-[#121212] border-[#2b2b2b]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="bg-[#121212] border-[#2b2b2b]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="w-full sm:w-auto">Update</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Change Password Tab */}
        <TabsContent value="change-password">
          <Card className="rounded-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <p className="text-muted-foreground text-sm">Password change UI goes here.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
