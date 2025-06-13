"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Search, Eye, Edit, Trash2 } from "lucide-react";

// Define Worker interface
interface Worker {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  nationality: string;
  dateOfBirth: string;
  nationalInsurance: string;
  passportNumber: string;
  passportExpiry: string;
  visaStatus: string;
  visaExpiry: string;
  startDate: string;
  salary: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  status: string;
}

// Comprehensive nationality list
const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentinian", "Armenian", 
  "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", 
  "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", 
  "British", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", 
  "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", 
  "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", 
  "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean", 
  "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino", "Finnish", "French", "Gabonese", 
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", 
  "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", 
  "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", 
  "Kenyan", "Korean", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", 
  "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", 
  "Malian", "Maltese", "Mauritanian", "Mauritian", "Mexican", "Moldovan", "Mongolian", "Montenegrin", 
  "Moroccan", "Mozambican", "Namibian", "Nepalese", "New Zealand", "Nicaraguan", "Nigerian", "Nigerien", 
  "Norwegian", "Omani", "Pakistani", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", 
  "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saudi", "Senegalese", "Serbian", 
  "Seychellois", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Somali", "South African", 
  "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", 
  "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", 
  "Turkish", "Turkmen", "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Venezuelan", "Vietnamese", 
  "Yemeni", "Zambian", "Zimbabwean"
];

// Job positions
const positions = [
  // Executive Level
  "Chief Executive Officer (CEO)", "Chief Technology Officer (CTO)", "Chief Financial Officer (CFO)", 
  "Chief Operating Officer (COO)", "Chief Marketing Officer (CMO)", "Chief Human Resources Officer (CHRO)",
  "Managing Director", "Executive Director", "Vice President", "Director",
  
  // Management Level
  "Senior Manager", "Manager", "Assistant Manager", "Team Leader", "Supervisor",
  
  // IT/Technology
  "IT Director", "IT Manager", "Solutions Architect", "Technical Lead", "Senior Software Engineer",
  "Software Engineer", "Junior Software Engineer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "Mobile Developer", "DevOps Engineer", "Data Scientist", "Data Engineer",
  "Database Administrator", "System Administrator", "Network Engineer", "Security Analyst",
  "QA Manager", "QA Engineer", "Technical Support Engineer",
  
  // Design/Creative
  "Creative Director", "Art Director", "Senior UX Designer", "UX Designer", "UI Designer",
  "Graphic Designer", "Product Designer", "Web Designer", "Motion Designer",
  
  // Marketing/Sales
  "Marketing Director", "Marketing Manager", "Digital Marketing Manager", "Brand Manager",
  "Marketing Executive", "Content Manager", "SEO Specialist", "Social Media Manager",
  "Sales Director", "Sales Manager", "Account Manager", "Business Development Manager",
  "Sales Executive", "Customer Success Manager",
  
  // HR/Administration
  "HR Director", "HR Manager", "HR Business Partner", "Talent Acquisition Manager",
  "HR Executive", "Recruiter", "Training Manager", "Payroll Manager",
  "Office Manager", "Administrative Manager", "Executive Assistant", "Administrative Assistant",
  "Receptionist",
  
  // Finance/Accounting
  "Finance Director", "Finance Manager", "Financial Controller", "Senior Accountant",
  "Accountant", "Junior Accountant", "Financial Analyst", "Payroll Officer",
  "Bookkeeper", "Audit Manager", "Internal Auditor",
  
  // Operations
  "Operations Director", "Operations Manager", "Project Manager", "Product Manager",
  "Business Analyst", "Supply Chain Manager", "Logistics Manager", "Quality Manager",
  
  // Other
  "Consultant", "Legal Counsel", "Compliance Officer", "Research Analyst", "Intern", "Apprentice"
];

// Departments
const departments = [
  "Administration", "Business Development", "Compliance", "Customer Service", "Engineering", 
  "Finance", "Human Resources", "Information Technology", "Legal", "Logistics", "Marketing", 
  "Operations", "Product", "Quality Assurance", "Research & Development", "Sales", "Supply Chain"
];

// Visa types for UK
const visaTypes = [
  "UK Citizen", "EU Settled Status", "EU Pre-Settled Status", "Indefinite Leave to Remain (ILR)",
  "Skilled Worker Visa", "Global Talent Visa", "Graduate Visa", "Student Visa", "Dependent Visa",
  "Family Visa", "Spouse Visa", "Ancestry Visa", "Youth Mobility Visa", "Visitor Visa",
  "Temporary Worker Visa", "Start-up Visa", "Innovator Visa", "Investor Visa", "Other"
];

// Salary ranges
const salaryRanges = [
  "£20,000 - £25,000", "£25,000 - £30,000", "£30,000 - £35,000", "£35,000 - £40,000",
  "£40,000 - £45,000", "£45,000 - £50,000", "£50,000 - £60,000", "£60,000 - £70,000",
  "£70,000 - £80,000", "£80,000 - £90,000", "£90,000 - £100,000", "£100,000 - £120,000",
  "£120,000 - £150,000", "£150,000 - £200,000", "£200,000+"
];

// Country codes for phone numbers
const countryCodes = [
  { code: "+44", country: "UK" },
  { code: "+1", country: "USA/Canada" },
  { code: "+353", country: "Ireland" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+63", country: "Philippines" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+351", country: "Portugal" },
  { code: "+31", country: "Netherlands" },
  { code: "+48", country: "Poland" },
  { code: "+40", country: "Romania" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
  { code: "+233", country: "Ghana" }
];

export default function WorkersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+44");
  const [emergencyPhoneCode, setEmergencyPhoneCode] = useState("+44");
  
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: "1",
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+44 7700 900123",
      department: "Engineering",
      position: "Senior Software Engineer",
      nationality: "British",
      dateOfBirth: "1985-03-15",
      nationalInsurance: "AB 12 34 56 C",
      passportNumber: "123456789",
      passportExpiry: "2028-06-30",
      visaStatus: "UK Citizen",
      visaExpiry: "N/A",
      startDate: "2022-01-15",
      salary: "£60,000 - £70,000",
      address: "123 High Street, London, SW1A 1AA",
      emergencyContact: "Jane Doe",
      emergencyPhone: "+44 7700 900456",
      emergencyRelation: "Spouse",
      status: "active"
    },
    {
      id: "2",
      employeeId: "EMP002",
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@company.com",
      phone: "+44 7700 900789",
      department: "Marketing",
      position: "Marketing Manager",
      nationality: "Spanish",
      dateOfBirth: "1990-07-22",
      nationalInsurance: "CD 34 56 78 D",
      passportNumber: "987654321",
      passportExpiry: "2027-12-15",
      visaStatus: "Skilled Worker Visa",
      visaExpiry: "2026-08-30",
      startDate: "2021-06-20",
      salary: "£50,000 - £60,000",
      address: "456 King Road, Manchester, M1 2AB",
      emergencyContact: "Carlos Garcia",
      emergencyPhone: "+34 600 123 456",
      emergencyRelation: "Father",
      status: "active"
    }
  ]);

  const handleAddWorker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWorker: Worker = {
      id: Date.now().toString(),
      employeeId: formData.get("employeeId") as string || "",
      firstName: formData.get("firstName") as string || "",
      lastName: formData.get("lastName") as string || "",
      email: formData.get("email") as string || "",
      phone: phoneCode + " " + (formData.get("phone") as string || ""),
      department: formData.get("department") as string || "",
      position: formData.get("position") as string || "",
      nationality: formData.get("nationality") as string || "",
      dateOfBirth: formData.get("dateOfBirth") as string || "",
      nationalInsurance: formData.get("nationalInsurance") as string || "",
      passportNumber: formData.get("passportNumber") as string || "",
      passportExpiry: formData.get("passportExpiry") as string || "",
      visaStatus: formData.get("visaStatus") as string || "",
      visaExpiry: formData.get("visaExpiry") as string || "",
      startDate: formData.get("startDate") as string || "",
      salary: formData.get("salary") as string || "",
      address: formData.get("address") as string || "",
      emergencyContact: formData.get("emergencyContact") as string || "",
      emergencyPhone: emergencyPhoneCode + " " + (formData.get("emergencyPhone") as string || ""),
      emergencyRelation: formData.get("emergencyRelation") as string || "",
      status: "active"
    };
    setWorkers([...workers, newWorker]);
    setShowAddModal(false);
    e.currentTarget.reset();
    setPhoneCode("+44");
    setEmergencyPhoneCode("+44");
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowViewModal(true);
  };

  const handleDeleteWorker = (id: string) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      setWorkers(workers.filter(w => w.id !== id));
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workers Management</h1>
          <p className="text-gray-600">UK Sponsor Licence Compliance System</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Worker Directory</CardTitle>
          <CardDescription>Complete HR records for sponsor compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total Workers: {filteredWorkers.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">Employee ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Nationality</th>
                  <th className="text-left p-3">Visa Status</th>
                  <th className="text-left p-3">Visa Expiry</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{worker.employeeId}</td>
                    <td className="p-3">{worker.firstName} {worker.lastName}</td>
                    <td className="p-3">{worker.email}</td>
                    <td className="p-3">{worker.department}</td>
                    <td className="p-3">{worker.nationality}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        worker.visaStatus === "UK Citizen" ? "bg-green-100 text-green-800" : 
                        worker.visaStatus.includes("ILR") ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {worker.visaStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {worker.visaExpiry === "N/A" ? (
                        <span className="text-gray-500">N/A</span>
                      ) : (
                        <span className={new Date(worker.visaExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? "text-red-600 font-medium" : ""}>
                          {worker.visaExpiry}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {worker.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewWorker(worker)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorker(worker.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWorkers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No workers found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Worker</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddWorker} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input id="employeeId" name="employeeId" required placeholder="EMP001" />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <select id="nationality" name="nationality" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select nationality</option>
                      {nationalities.map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="nationalInsurance">National Insurance Number</Label>
                    <Input id="nationalInsurance" name="nationalInsurance" placeholder="AB 12 34 56 C" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex gap-2">
                      <select 
                        value={phoneCode} 
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="px-3 py-2 border rounded-md w-32"
                      >
                        {countryCodes.map(cc => (
                          <option key={cc.code} value={cc.code}>{cc.code} {cc.country}</option>
                        ))}
                      </select>
                      <Input id="phone" name="phone" required placeholder="7700 900123" className="flex-1" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input id="address" name="address" required placeholder="123 High Street, London, SW1A 1AA" />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Contact Name *</Label>
                    <Input id="emergencyContact" name="emergencyContact" required />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelation">Relationship *</Label>
                    <select id="emergencyRelation" name="emergencyRelation" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone *</Label>
                    <div className="flex gap-2">
                      <select 
                        value={emergencyPhoneCode} 
                        onChange={(e) => setEmergencyPhoneCode(e.target.value)}
                        className="px-3 py-2 border rounded-md w-32"
                      >
                        {countryCodes.map(cc => (
                          <option key={cc.code} value={cc.code}>{cc.code} {cc.country}</option>
                        ))}
                      </select>
                      <Input id="emergencyPhone" name="emergencyPhone" required placeholder="7700 900456" className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <select id="department" name="department" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <select id="position" name="position" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary Range *</Label>
                    <select id="salary" name="salary" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select salary range</option>
                      {salaryRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Immigration Information */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold mb-4">Immigration Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input id="passportNumber" name="passportNumber" />
                  </div>
                  <div>
                    <Label htmlFor="passportExpiry">Passport Expiry</Label>
                    <Input id="passportExpiry" name="passportExpiry" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="visaStatus">Visa Status *</Label>
                    <select id="visaStatus" name="visaStatus" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select visa status</option>
                      {visaTypes.map(visa => (
                        <option key={visa} value={visa}>{visa}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="visaExpiry">Visa Expiry</Label>
                    <Input id="visaExpiry" name="visaExpiry" type="date" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Add Worker
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Worker Modal */}
      {showViewModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Worker Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee ID:</span> {selectedWorker.employeeId}
                  </div>
                  <div>
                    <span className="font-medium">Name:</span> {selectedWorker.firstName} {selectedWorker.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Date of Birth:</span> {selectedWorker.dateOfBirth}
                  </div>
                  <div>
                    <span className="font-medium">Nationality:</span> {selectedWorker.nationality}
                  </div>
                  <div>
                    <span className="font-medium">NI Number:</span> {selectedWorker.nationalInsurance}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {selectedWorker.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedWorker.phone}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span> {selectedWorker.address}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedWorker.emergencyContact}
                  </div>
                  <div>
                    <span className="font-medium">Relationship:</span> {selectedWorker.emergencyRelation}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedWorker.emergencyPhone}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Department:</span> {selectedWorker.department}
                  </div>
                  <div>
                    <span className="font-medium">Position:</span> {selectedWorker.position}
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span> {selectedWorker.startDate}
                  </div>
                  <div>
                    <span className="font-medium">Salary:</span> {selectedWorker.salary}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Immigration Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Passport Number:</span> {selectedWorker.passportNumber}
                  </div>
                  <div>
                    <span className="font-medium">Passport Expiry:</span> {selectedWorker.passportExpiry}
                  </div>
                  <div>
                    <span className="font-medium">Visa Status:</span> {selectedWorker.visaStatus}
                  </div>
                  <div>
                    <span className="font-medium">Visa Expiry:</span> {selectedWorker.visaExpiry}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}