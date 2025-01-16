import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const CreateTaskPage = () => {
  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Task</CardTitle>
              <CardDescription>
                Create and assign task to members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3">
                <div>
                  <label htmlFor="title">Title</label>
                  <Input placeholder="Enter title" id="title" />
                  </div>
                <div>
                  <label htmlFor="description">Description</label>
                  <Textarea placeholder="Enter description" id="description" />
                  </div>
                <div>
                  <label htmlFor="assignee">Assignee</label>
                  <Select>
                    <SelectTrigger className="">
                      <SelectValue placeholder="users" />
                    </SelectTrigger>
                    <SelectContent id="assignee">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>

                <div>
                  <label htmlFor="date">Date</label>
                  <Input type="date"  id="date" />
                  </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskPage