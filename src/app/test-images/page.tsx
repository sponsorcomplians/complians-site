export default function TestImages() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Direct Image Test</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p>Qualification Agent:</p>
          <img 
            src="/images/ai-qualification-compliance-agent.png" 
            alt="test1" 
            width="200" 
            height="150"
          />
        </div>
        <div>
          <p>Salary Agent:</p>
          <img 
            src="/images/ai-salary-compliance-agent.png" 
            alt="test2" 
            width="200" 
            height="150"
          />
        </div>
        <div>
          <p>Right to Work Agent:</p>
          <img 
            src="/images/ai-right-to-work-agent.png" 
            alt="test3" 
            width="200" 
            height="150"
          />
        </div>
      </div>
    </div>
  )
} 