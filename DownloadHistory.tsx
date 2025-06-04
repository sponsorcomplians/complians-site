import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Download, Calendar, FileText } from 'lucide-react'

export default async function DownloadHistory() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Get download logs for the user
  const { data: downloads, error } = await supabase
    .from('download_logs')
    .select(`
      *,
      products (
        title,
        slug
      )
    `)
    .eq('user_id', user.id)
    .order('downloaded_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching download history:', error)
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Downloads</h2>
      </div>

      {downloads && downloads.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {downloads.map((download) => (
            <div key={download.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#263976] rounded-lg flex items-center justify-center mr-4">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {download.products?.title || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {download.file_path.split('/').pop()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(download.downloaded_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600">No downloads yet</p>
        </div>
      )}
    </div>
  )
}

