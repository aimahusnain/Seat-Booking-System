'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { ExternalLink, HelpCircle, Mail, PhoneCall, Clock } from "lucide-react"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              How Can We Help You?
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              We&apos;re here to help! Reach out to us through any of the options below.
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Email Support */}
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Get personalized help from our support team
                </p>
                <a 
                  href="mailto:seating4you@gmail.com"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  seating4you@gmail.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Phone Support */}
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="bg-primary/10 p-3 rounded-full">
                <PhoneCall className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Speak directly with our team
                </p>
                <a 
                  href="tel:+14178930047"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  (417) 893-0047
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Support Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday to Friday: 9:00 AM - 12:00 PM EST
                </p>
              </div>
            </div>
          </div>

          {/* Devkins Attribution */}
          <div className="border-t pt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Created by{' '}
              <a 
                href="https://devkins.dev/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Devkins
              </a>
            </p>
            <a 
              href="mailto:devkins.dev@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Need a custom app?
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}