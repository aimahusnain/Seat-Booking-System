'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { ExternalLink, HelpCircle, Mail, PhoneCall } from "lucide-react"
import { useState } from "react"

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-6 gap-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-primary">
              How Can We Help You?
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              We&apos;re here to help! Choose from the options below to get the support you need.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Help Center Section */}
            <div className="bg-slate-50 p-4 rounded-lg border hover:border-primary transition-colors">
              <div className="flex items-start space-x-3">
                <ExternalLink className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Help Center</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Browse through our comprehensive guides, tutorials, and FAQs.
                  </p>
                  <a 
                    href="https://devkins.dev/contact" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                  >
                    Visit Help Center
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Email Support Section */}
            <div className="bg-slate-50 p-4 rounded-lg border hover:border-primary transition-colors">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get personalized help from our support team.
                  </p>
                  <a 
                    href="mailto:devkins.dev@gmail.com"
                    className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                  >
                    devkins.dev@gmail.com
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Hours Section */}
            <div className="md:col-span-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-3">
                <PhoneCall className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Support Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday to Friday: 9:00 AM - 12:00 PM EST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}