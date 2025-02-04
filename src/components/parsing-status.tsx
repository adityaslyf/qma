import { Loader } from "./ui/loader"

interface ParsingStatusProps {
  status: string
//   progress: number
}

export function ParsingStatus({ status }: ParsingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <Loader 
        variant="bars" 
        size="lg" 
        text={status}
      />
      
      <div className="w-full max-w-xs">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          {/* <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          /> */}
        </div>
        {/* <p className="text-xs text-muted-foreground text-center mt-2">
          {progress}%
        </p> */}
      </div>
    </div>
  )
}
