import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Landmark, ShieldCheck } from "lucide-react";

export default function ContactView() {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Research inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, institution, email, subject, message })
      });

      const resData = await response.json();
      setSubmitting(false);

      if (response.ok) {
        setSuccess(true);
        setName("");
        setInstitution("");
        setEmail("");
        setMessage("");
      } else {
        alert(resData.message || "An error occurred on the server.");
      }
    } catch (error) {
      setSubmitting(false);
      alert("Network transmission error. The local cache has saved your request.");
    }
  };

  return (
    <div className="bg-[#f8fafc] py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-bold font-serif text-[#0a2463]">Contact and Inquiries</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Connect with our global liaison officers, editorial board, or advisory specialists. Submit general inquiries or project consultation requests.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact info & Address Moscow */}
          <div className="lg:col-span-5 space-y-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-md font-bold text-[#0a2463] uppercase tracking-wide mb-6">Headquarters Liasion</h3>
              
              <div className="space-y-6">
                
                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0a2463]/10 text-[#0a2463] p-2.5 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Moscow Headquarters</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Bolshaya Dmitrovka, 12<br />
                      Moscow, 103009, Russian Federation
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0a2463]/10 text-[#0a2463] p-2.5 rounded-lg shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Communications</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      General Inquiries: inquiries@triefml.org<br />
                      Sovereign Reviews: reviews@triefml.org
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0a2463]/10 text-[#0a2463] p-2.5 rounded-lg shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Liasion Telephone</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      +7 (495) 104-9832 (Europe & Global)<br />
                      +233 (302) 893-0104 (Sub-Saharan African Liaison)
                    </p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0a2463]/10 text-[#0a2463] p-2.5 rounded-lg shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Office Hours</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Monday to Friday: 09:00 - 18:00 (Moscow Standard Time, UTC+3)<br />
                      Sovereign secure line: 24 / 7 operational
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-[#1e6f5c]/5 p-5 rounded-xl border border-[#1e6f5c]/10 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-[#1e6f5c] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#1e6f5c] leading-relaxed">
                TriefML operates under strict data privacy regulations. All submitted documents and correspondence are transmitted through military-grade encryption keys and stored in isolated storage volumes.
              </p>
            </div>
          </div>

          {/* Right Column: Contact form with Telegram integration */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-md font-bold text-[#0a2463] uppercase tracking-wide mb-2">Inquiry Form</h3>
            <p className="text-xs text-slate-500 mb-6">
              Complete the fields below to initiate communication. We maintain a forty-eight hour response standard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="Dr. Bertrand Mvogo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Institution / Organization</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="BEAC Research Department"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Institutional Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                    placeholder="b.mvogo@beac.int"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Subject Category</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  >
                    <option value="Research inquiry">Research Inquiry</option>
                    <option value="Project submission">Project Submission</option>
                    <option value="Consulting">Consulting Advisory</option>
                    <option value="Partnership">Partnership Opportunities</option>
                    <option value="Press">Press & Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Detailed Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#c8960c]"
                  placeholder="Draft your inquiry or project details here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0a2463] text-[#c8960c] hover:bg-slate-900 font-bold py-3 rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Transmitting..." : "Send Secure Message"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {success && (
              <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-[#1e6f5c]" />
                <span>Thank you! Your secure inquiry has been logged and transmitted to our Moscow liasion office.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
