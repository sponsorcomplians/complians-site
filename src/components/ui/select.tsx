export const Select = (props) => <div {...props} />
export const SelectTrigger = (props) => <button className="h-10 w-full border rounded-md px-3 py-2" {...props} />
export const SelectValue = ({ placeholder = "Select..." }) => <span>{placeholder}</span>
export const SelectContent = (props) => <div className="border rounded-md shadow-md" {...props} />
export const SelectItem = (props) => <div className="px-4 py-2 hover:bg-gray-100" {...props} />