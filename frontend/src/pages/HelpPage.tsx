import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HelpPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Help & FAQ</h1>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is OpenVulog?</AccordionTrigger>
          <AccordionContent>
            OpenVulog is a tool designed to help security teams log, track, and
            manage security vulnerabilities in a centralized and efficient way.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How do I add a new vulnerability?</AccordionTrigger>
          <AccordionContent>
            To add a new vulnerability, navigate to the Dashboard and click the
            "Add New" button. Fill out the required fields in the form,
            including the vulnerability name, description, severity, and
            status, then click "Add Vulnerability".
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>How do I edit or delete a vulnerability?</AccordionTrigger>
          <AccordionContent>
            From the Dashboard, you can find the vulnerability you wish to
            modify in the table. Click the "Edit" button to open the form with
            the existing data, or click the "Delete" button and confirm the
            action in the dialog that appears. Note that only users with admin
            privileges can perform these actions.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>What do the different severity levels mean?</AccordionTrigger>
          <AccordionContent>
            Severity levels help prioritize vulnerabilities. Here's a general
            guide:
            <ul className="list-disc pl-6 mt-2">
              <li>
                <b>Critical:</b> Vulnerabilities that can be easily exploited
                and could lead to a full system compromise.
              </li>
              <li>
                <b>High:</b> Vulnerabilities that are difficult to exploit but
                could cause significant damage.
              </li>
              <li>
                <b>Medium:</b> Vulnerabilities that could provide attackers with
                valuable information or limited access.
              </li>
              <li>
                <b>Low:</b> Minor issues that have a small impact and are
                unlikely to be exploited.
              </li>
              <li>
                <b>Informational:</b> Findings that are not direct
                vulnerabilities but are worth noting.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>How do I manage users? (Admin Only)</AccordionTrigger>
          <AccordionContent>
            If you are an administrator, you can access the "User Management"
            page from the sidebar. On this page, you can view all registered
            users, add new users by clicking the "Add New User" button, or
            delete existing users.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
