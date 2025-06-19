{documents.map((doc) => {
  const originalKey = `${doc.field}_original` as keyof MigrantTrackingData;
  const copyKey = `${doc.field}_copy` as keyof MigrantTrackingData;
  const dateKey = `${doc.field}_date` as keyof MigrantTrackingData;

  return (
    <div key={doc.code} className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium">
            {doc.code} - {doc.name}
            {doc.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          <p className="text-sm text-muted-foreground">{doc.description}</p>
        </div>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={originalKey}
              checked={data[originalKey] || false}
              onCheckedChange={(checked) =>
                handleFieldChange(originalKey, checked)
              }
            />
            <Label htmlFor={originalKey} className="text-sm">
              Original Seen
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={copyKey}
              checked={data[copyKey] || false}
              onCheckedChange={(checked) =>
                handleFieldChange(copyKey, checked)
              }
            />
            <Label htmlFor={copyKey} className="text-sm">
              Copy Made
            </Label>
          </div>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data[dateKey] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data[dateKey]
                  ? format(new Date(data[dateKey] as string), "dd/MM/yyyy")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data[dateKey] ? new Date(data[dateKey] as string) : undefined}
                onSelect={(date) =>
                  handleFieldChange(dateKey, date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
})}
