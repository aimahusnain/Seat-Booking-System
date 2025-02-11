import { Loader2 } from 'lucide-react'

const loader = () => {
  return (
    <div className='w-screen h-screen flex gap-2 items-center justify-center flex-col'>
        <Loader2 className='h-12 w-12 animate-spin' />
        Loading..</div>
  )
}

export default loader