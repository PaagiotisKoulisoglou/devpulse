import SyncButton from '@/components/SyncButton'

interface HeaderProps {
  username: string
  avatarUrl: string | null
  email: string
}

export default function Header({ username, avatarUrl, email }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-12 h-12 rounded-full ring-2 ring-gray-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-white">{username}</h1>
          <p className="text-gray-400 text-sm">{email}</p>
        </div>
      </div>
      <SyncButton />
    </div>
  )
}