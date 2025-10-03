import Image from "next/image";
import Link from "next/link";

export default function UserGuide() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-black mb-2">
                User Guide
              </h1>
              <p className="text-zinc-500">
                Complete instructions for managing your event seating
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-lime-500 text-white font-medium hover:bg-lime-600 transition-colors"
            >
              Try the App
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Dashboard Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Dashboard Overview
          </h2>
          <p className="text-zinc-600 mb-8">
            Your dashboard displays real-time information about your event.
            Here&apos;s what each metric means:
          </p>

          {/* Live Dashboard Demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Seats */}
            <div className="relative">
              <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Total Seats
                </div>
                <div className="text-4xl font-bold text-zinc-800 mb-3">150</div>
              </div>
              {/* Sticky Note */}
              <div className="absolute -bottom-12 -right-3 bg-yellow-200 border-2 border-yellow-300 rounded-lg p-3 shadow-lg transform rotate-3 max-w-[200px] z-10">
                <div className="text-xs font-medium text-zinc-800 leading-relaxed">
                  📍 Total room capacity - how many seats your venue is set for
                </div>
              </div>
            </div>

            {/* Invited Guests */}
            <div className="relative">
              <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs uppercase tracking-wider text-cyan-600 mb-2">
                  Invited
                </div>
                <div className="text-4xl font-bold text-cyan-800 mb-3">142</div>
              </div>
              {/* Sticky Note */}
              <div className="absolute -bottom-12 -right-3 bg-yellow-200 border-2 border-yellow-300 rounded-lg p-3 shadow-lg transform -rotate-2 max-w-[200px] z-10">
                <div className="text-xs font-medium text-zinc-800 leading-relaxed">
                  📍 Total guests on your invitation list
                </div>
              </div>
            </div>

            {/* Assigned Seats */}
            <div className="relative">
              <div className="bg-red-50 rounded-lg border border-red-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs uppercase tracking-wider text-red-600 mb-2">
                  Assigned
                </div>
                <div className="text-4xl font-bold text-red-800 mb-3">128</div>
              </div>
              {/* Sticky Note */}
              <div className="absolute -bottom-12 -right-3 bg-yellow-200 border-2 border-yellow-300 rounded-lg p-3 shadow-lg transform rotate-1 max-w-[200px] z-10">
                <div className="text-xs font-medium text-zinc-800 leading-relaxed">
                  📍 Guests assigned to specific seats
                </div>
              </div>
            </div>

            {/* Available Seats */}
            <div className="relative">
              <div className="bg-green-50 rounded-lg border border-green-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs uppercase tracking-wider text-green-600 mb-2">
                  Available
                </div>
                <div className="text-4xl font-bold text-green-800 mb-3">22</div>
              </div>
              {/* Sticky Note */}
              <div className="absolute -bottom-12 -right-3 bg-yellow-200 border-2 border-yellow-300 rounded-lg p-3 shadow-lg transform -rotate-3 max-w-[200px] z-10">
                <div className="text-xs font-medium text-zinc-800 leading-relaxed">
                  📍 Empty seats still available for assignment
                </div>
              </div>
            </div>

            {/* Arrived Guests */}
            <div className="relative">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs uppercase tracking-wider text-blue-600 mb-2">
                  Arrived
                </div>
                <div className="text-4xl font-bold text-blue-800 mb-3">95</div>
              </div>
              {/* Sticky Note */}
              <div className="absolute -bottom-12 -right-3 bg-yellow-200 border-2 border-yellow-300 rounded-lg p-3 shadow-lg transform rotate-2 max-w-[200px] z-10">
                <div className="text-xs font-medium text-zinc-800 leading-relaxed">
                  📍 Guests who have checked in at the event
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assigning Guests */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Assigning Guests
          </h2>

          {/* Single Guest */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Assign Single Guest
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/tableview.png"
                  alt="Single Guest Assignment Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>Click on any seat number in the seating chart</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>
                    Find and click on the guest&apos;s name from the list (do
                    not check the check box with name)
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>Click &quot;Confirm Booking&quot;</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Multiple Guests */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Assign Multiple Guests
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/multiple-guest-assignment-Image.png"
                  alt="Multiple Guest Assignment Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>
                    Select multiple guests from the list (up to 10, depending on
                    table capacity)
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>
                    Example: If table is set for 5 guests, select up to 5 names
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>Assign all selected guests to the table at once</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Table Management */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Table Management
          </h2>

          {/* Create New Table */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Create New Table
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/new-table-creation-image.png"
                  alt="New Table Creation Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>Click &quot;New Table&quot; button</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Select the number of chairs needed for the table</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>
                    Click &quot;Autofill Seats&quot; to generate seat numbers
                    automatically
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">4.</span>
                  <span>Click &quot;Add Table&quot; to complete</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Rename Table */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Rename Table
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/rename-table-image.png"
                  alt="Rename Table Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>Hover your cursor over the table name</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Click to edit and enter the new table name</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>Press Enter or click outside to save</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Guest Management */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Guest Management
          </h2>

          {/* Add Guest Manually */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Add Guest Manually
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/add-guest-form-image.png"
                  alt="Add Guest Form Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>Click &quot;New Guest&quot; button</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Enter guest&apos;s first name</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>Enter guest&apos;s last name</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">4.</span>
                  <span>Click &quot;Add Guest&quot; to save</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Remove Guest */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Need to make changes?
            </h3>
            <div className="border border-zinc-200 p-6 bg-zinc-50">
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>
                    Navigate to &quot;Assigned Seats&quot; section on the right
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Find the guest&apos;s name in the list</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>
                    Click the &quot;Delete&quot; button next to their name
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* View Guest Names */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              View Guest Names on Tables
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/remove-guest-from-table.png"
                  alt="Remove Guest from Table"
                  width={800}
                  height={800}
                />
              </div>
              <p className="text-zinc-600">
                Click the view toggle to display guest names directly on the
                seating chart for easy reference.
              </p>
            </div>
          </div>
        </section>

        {/* Arrival Tracking */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Tracking Arrivals
          </h2>

          {/* Manual Arrival */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Mark Arrival Manually
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/manual-arrival-check-image.png"
                  alt="Manual Arrival Check Image"
                  width={450}
                  height={450}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>
                    Go to &quot;Assigned Seats&quot; section on the right
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Search for the guest&apos;s name</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>
                    Check the &quot;Arrived&quot; box next to their name
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">4.</span>
                  <span>Optional: Print confirmation if needed</span>
                </li>
              </ol>
            </div>
          </div>

          {/* QR Code Scanning */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              QR Code Check-in
            </h3>
            <div className="border border-zinc-200 p-6">
              <div className="w-full h-fit bg-[#FAFAFA] mb-4 flex items-center justify-center text-zinc-400">
                <Image
                  src="/qr-code-scanner-image.png"
                  alt="QR Code Scanner Image"
                  width={250}
                  height={250}
                />
              </div>
              <ol className="space-y-3 text-zinc-600">
                <li className="flex">
                  <span className="font-medium text-black mr-2">1.</span>
                  <span>Click the QR code icon to the right of the logo</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">2.</span>
                  <span>Guest scans their personal QR code upon arrival</span>
                </li>
                <li className="flex">
                  <span className="font-medium text-black mr-2">3.</span>
                  <span>
                    System automatically marks them as arrived and displays
                    their seat assignment
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-black mb-6 pb-3 border-b border-zinc-200">
            Tips & Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-zinc-200 p-6 bg-zinc-50">
              <h3 className="font-medium text-black mb-3">Planning</h3>
              <ul className="text-sm text-zinc-600 space-y-2">
                <li>• Set up all tables before assigning guests</li>
                <li>• Use descriptive table names for easy reference</li>
                <li>• Double-check room capacity matches your setup</li>
              </ul>
            </div>
            <div className="border border-zinc-200 p-6 bg-zinc-50">
              <h3 className="font-medium text-black mb-3">Event Day</h3>
              <ul className="text-sm text-zinc-600 space-y-2">
                <li>• Position QR scanner at entrance for easy access</li>
                <li>• Have a backup device ready</li>
                <li>• Monitor arrival dashboard for real-time updates</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="border-t border-zinc-200 pt-12">
          <div className="text-center">
            <h2 className="text-2xl font-light text-black mb-4">
              Need More Help?
            </h2>
            <p className="text-zinc-600 mb-6">
              Our support team is ready to assist you
            </p>
            <a
              href="tel:417-893-0047"
              className="inline-block px-8 py-3 bg-lime-500 text-white font-medium hover:bg-lime-600 transition-colors"
            >
              Contact Support: 417-893-0047
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
