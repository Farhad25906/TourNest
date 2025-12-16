'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Dummy blog data
const blogs = [
  {
    id: '1',
    title: 'Hidden Gems of Bali: Beyond the Tourist Trail',
    excerpt: 'Discover the secret spots that most tourists miss in Bali...',
    content: 'After hosting over 50 tours in Bali, I have discovered some incredible hidden gems that most tourists never get to see. From secret waterfalls to traditional villages untouched by mass tourism, these places will give you an authentic Balinese experience.',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop',
    category: 'DESTINATION',
    status: 'PUBLISHED',
    views: 1240,
    likesCount: 89,
    host: {
      id: 'host1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
    createdAt: '2024-12-10T10:30:00Z',
    isLiked: false,
    comments: [
      {
        id: 'c1',
        content: 'This is amazing! I visited Bali last year and wish I knew about these places.',
        author: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        },
        createdAt: '2024-12-10T12:00:00Z',
        likes: 5,
      },
      {
        id: 'c2',
        content: 'Definitely booking your next Bali tour! 🌴',
        author: {
          name: 'Emma Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        },
        createdAt: '2024-12-10T14:30:00Z',
        likes: 3,
      },
    ],
  },
  {
    id: '2',
    title: 'The Ultimate Tokyo Food Tour Guide',
    excerpt: 'From street food to Michelin stars, explore Tokyo culinary scene...',
    content: 'Tokyo is a food lovers paradise! In this guide, I will share my favorite local spots, hidden ramen shops, and the best sushi experience you can have outside of Tsukiji Market. Get ready for a culinary adventure!',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop',
    category: 'FOOD',
    status: 'PUBLISHED',
    views: 2100,
    likesCount: 156,
    host: {
      id: 'host2',
      name: 'Kenji Tanaka',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    },
    createdAt: '2024-12-09T08:15:00Z',
    isLiked: true,
    comments: [
      {
        id: 'c3',
        content: 'I need to try that ramen place you mentioned! 🍜',
        author: {
          name: 'Lisa Park',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        },
        createdAt: '2024-12-09T09:30:00Z',
        likes: 8,
      },
    ],
  },
  {
    id: '3',
    title: 'Solo Travel Safety Tips for Peru',
    excerpt: 'Everything you need to know to stay safe while exploring Peru...',
    content: 'Peru is an incredible destination, but like anywhere, it is important to stay safe. Here are my top safety tips from years of leading tours through Machu Picchu, Cusco, and the Amazon.',
    coverImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=500&fit=crop',
    category: 'TIPS',
    status: 'PUBLISHED',
    views: 890,
    likesCount: 67,
    host: {
      id: 'host3',
      name: 'Carlos Rivera',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    },
    createdAt: '2024-12-08T16:45:00Z',
    isLiked: false,
    comments: [],
  },
  {
    id: '4',
    title: 'Best Time to Visit Santorini',
    excerpt: 'Avoid the crowds and discover the perfect season...',
    content: 'While summer is peak season in Santorini, I will let you in on a secret - spring and fall are actually the best times to visit! Fewer tourists, better prices, and the weather is still gorgeous.',
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=500&fit=crop',
    category: 'DESTINATION',
    status: 'PUBLISHED',
    views: 1567,
    likesCount: 112,
    host: {
      id: 'host4',
      name: 'Maria Papadopoulos',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    },
    createdAt: '2024-12-07T11:20:00Z',
    isLiked: false,
    comments: [
      {
        id: 'c4',
        content: 'Great advice! Planning my trip for October now.',
        author: {
          name: 'John Smith',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        },
        createdAt: '2024-12-07T13:00:00Z',
        likes: 4,
      },
      {
        id: 'c5',
        content: 'The photos are stunning! 😍',
        author: {
          name: 'Anna Lee',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
        },
        createdAt: '2024-12-07T15:30:00Z',
        likes: 2,
      },
    ],
  },
]

function BlogCard({ blog }: { blog: typeof blogs[0] }) {
  const [isLiked, setIsLiked] = useState(blog.isLiked)
  const [likesCount, setLikesCount] = useState(blog.likesCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(blog.comments)
  const [newComment, setNewComment] = useState('')

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1)
      setIsLiked(false)
    } else {
      setLikesCount(prev => prev + 1)
      setIsLiked(true)
    }
  }

  const handleComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `c${Date.now()}`,
        content: newComment,
        author: {
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        },
        createdAt: new Date().toISOString(),
        likes: 0,
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={blog.host.avatar} alt={blog.host.name} />
            <AvatarFallback>{blog.host.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{blog.host.name}</h3>
            <p className="text-sm text-gray-500">{getTimeAgo(blog.createdAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h2>
        <p className="text-gray-700 mb-3">{blog.content}</p>
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
          {blog.category}
        </span>
      </div>

      {/* Cover Image */}
      <div className="w-full">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          width={800}
          height={500}
          className="w-full object-cover"
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
        <span>{likesCount} likes</span>
        <span>{comments.length} comments • {blog.views} views</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-2">
        <Button
          variant="ghost"
          className={`flex-1 gap-2 ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} />
          Like
        </Button>
        <Button
          variant="ghost"
          className="flex-1 gap-2 text-gray-600"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-gray-600">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <p className="font-semibold text-sm text-gray-900">{comment.author.name}</p>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 px-4">
                    <button className="text-xs text-gray-600 hover:text-blue-600 font-medium">
                      Like
                    </button>
                    <button className="text-xs text-gray-600 hover:text-blue-600 font-medium">
                      Reply
                    </button>
                    <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="border-gray-300 rounded-full"
              />
              <Button
                size="icon"
                onClick={handleComment}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BlogFeed() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Travel Stories</h1>
          <p className="text-sm text-gray-600">Discover amazing travel experiences from our hosts</p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}