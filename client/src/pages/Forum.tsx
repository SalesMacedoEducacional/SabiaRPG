import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Avatar } from '@/components/Avatar';
import {
  MessageSquare,
  Plus,
  RefreshCcw,
  Search,
  Send,
  MessageCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Form schemas
const newPostSchema = z.object({
  title: z.string().min(3, { message: 'O título precisa ter pelo menos 3 caracteres' }),
  content: z.string().min(10, { message: 'O conteúdo precisa ter pelo menos 10 caracteres' }),
  pathId: z.string().optional(),
  missionId: z.string().optional(),
});

const replySchema = z.object({
  content: z.string().min(5, { message: 'A resposta precisa ter pelo menos 5 caracteres' }),
});

const Forum: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  
  // Forms
  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });
  
  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: '',
    },
  });
  
  // Fetch forum posts
  const {
    data: forumPosts = [],
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['/api/forum-posts'],
  });
  
  // Fetch learning paths for the dropdown
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['/api/learning-paths'],
  });
  
  // Fetch missions for the dropdown
  const { data: missions = [] } = useQuery({
    queryKey: ['/api/missions'],
  });
  
  // Fetch post replies when a post is selected
  const {
    data: postReplies = [],
    isLoading: repliesLoading,
    refetch: refetchReplies,
  } = useQuery({
    queryKey: ['/api/forum-posts', selectedPost, 'replies'],
    queryFn: () => fetch(`/api/forum-posts/${selectedPost}/replies`).then(res => res.json()),
    enabled: selectedPost !== null,
  });
  
  // Mutation to create a new post
  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newPostSchema>) => {
      // Convert string IDs to numbers if they exist
      const formattedData = {
        ...data,
        pathId: data.pathId ? parseInt(data.pathId) : undefined,
        missionId: data.missionId ? parseInt(data.missionId) : undefined,
      };
      
      const response = await apiRequest('POST', '/api/forum-posts', formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum-posts'] });
      setNewPostOpen(false);
      newPostForm.reset();
      toast({
        title: 'Publicação criada',
        description: 'Sua publicação foi criada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a publicação',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to create a reply
  const createReplyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof replySchema>) => {
      const response = await apiRequest('POST', '/api/forum-replies', {
        postId: selectedPost,
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum-posts', selectedPost, 'replies'] });
      replyForm.reset();
      toast({
        title: 'Resposta enviada',
        description: 'Sua resposta foi enviada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a resposta',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submissions
  const onCreatePost = (data: z.infer<typeof newPostSchema>) => {
    createPostMutation.mutateAsync(data);
  };
  
  const onCreateReply = (data: z.infer<typeof replySchema>) => {
    createReplyMutation.mutateAsync(data);
  };
  
  // Filter posts based on activeTab and searchTerm
  const filteredPosts = forumPosts.filter((post: any) => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'my-posts') return post.userId === user?.id;
    if (activeTab === 'my-area') {
      // In a real implementation, we would filter by the user's preferred areas
      // For now, let's return true for simplicity
      return true;
    }
    
    return true;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getAreaBadge = (areaName?: string) => {
    if (!areaName) return null;
    
    const areaStyles: Record<string, string> = {
      mathematics: 'bg-secondary text-dark',
      languages: 'bg-accent text-dark',
      sciences: 'bg-blue-500 text-white',
      history: 'bg-red-600 text-white',
      geography: 'bg-green-500 text-white',
      arts: 'bg-purple-500 text-white',
    };
    
    const areaLabels: Record<string, string> = {
      mathematics: 'Matemática',
      languages: 'Linguagens',
      sciences: 'Ciências',
      history: 'História',
      geography: 'Geografia',
      arts: 'Artes',
    };
    
    return (
      <Badge className={areaStyles[areaName] || 'bg-primary'}>
        {areaLabels[areaName] || areaName}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-medieval text-accent">Fórum</h1>
            <p className="text-parchment-dark">
              Compartilhe suas dúvidas, descobertas e discuta sobre as missões
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0">
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-dark hover:bg-accent-dark">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Publicação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-light border-primary">
                <form onSubmit={newPostForm.handleSubmit(onCreatePost)}>
                  <DialogHeader>
                    <DialogTitle className="text-accent font-medieval">Nova Publicação</DialogTitle>
                    <DialogDescription>
                      Crie uma nova publicação para compartilhar ou perguntar sobre um assunto
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título</label>
                      <Input
                        placeholder="Título da publicação"
                        className="bg-dark border-primary text-parchment"
                        {...newPostForm.register('title')}
                      />
                      {newPostForm.formState.errors.title && (
                        <p className="text-red-500 text-xs mt-1">
                          {newPostForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trilha (opcional)</label>
                      <Select
                        onValueChange={(value) => newPostForm.setValue('pathId', value)}
                      >
                        <SelectTrigger className="bg-dark border-primary text-parchment">
                          <SelectValue placeholder="Selecione uma trilha" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-light border-primary">
                          <SelectItem value="">Nenhuma trilha</SelectItem>
                          {learningPaths.map((path: any) => (
                            <SelectItem key={path.id} value={path.id.toString()}>
                              {path.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Missão (opcional)</label>
                      <Select
                        onValueChange={(value) => newPostForm.setValue('missionId', value)}
                      >
                        <SelectTrigger className="bg-dark border-primary text-parchment">
                          <SelectValue placeholder="Selecione uma missão" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-light border-primary">
                          <SelectItem value="">Nenhuma missão</SelectItem>
                          {missions.map((mission: any) => (
                            <SelectItem key={mission.id} value={mission.id.toString()}>
                              {mission.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Conteúdo</label>
                      <Textarea
                        placeholder="Escreva o conteúdo da sua publicação..."
                        className="bg-dark border-primary text-parchment min-h-[150px]"
                        {...newPostForm.register('content')}
                      />
                      {newPostForm.formState.errors.content && (
                        <p className="text-red-500 text-xs mt-1">
                          {newPostForm.formState.errors.content.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setNewPostOpen(false)}
                      className="border-primary"
                      type="button"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-accent text-dark hover:bg-accent-dark"
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? 'Enviando...' : 'Publicar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              className="ml-2 border-primary"
              onClick={() => {
                refetchPosts();
                if (selectedPost) refetchReplies();
              }}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Forum posts list */}
          <div className="md:col-span-1">
            <Card className="bg-dark-light border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Publicações
                </CardTitle>
                
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parchment-dark h-4 w-4" />
                    <Input
                      placeholder="Buscar publicações..."
                      className="pl-10 bg-dark border-primary text-parchment"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-dark border border-primary w-full">
                      <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary">
                        Todas
                      </TabsTrigger>
                      <TabsTrigger value="my-posts" className="flex-1 data-[state=active]:bg-primary">
                        Minhas
                      </TabsTrigger>
                      <TabsTrigger value="my-area" className="flex-1 data-[state=active]:bg-primary">
                        Minha Área
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  {postsLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
                      <p className="mt-2 text-parchment-dark">Carregando publicações...</p>
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="divide-y divide-primary">
                      {filteredPosts.map((post: any) => (
                        <div
                          key={post.id}
                          className={`p-4 cursor-pointer hover:bg-dark ${
                            selectedPost === post.id ? 'bg-dark' : ''
                          }`}
                          onClick={() => setSelectedPost(post.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar user={post.user} size="small" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-cinzel text-base truncate">{post.title}</h3>
                              <p className="text-sm text-parchment-dark truncate">{post.content}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-parchment-dark">
                                  {formatDate(post.createdAt)}
                                </span>
                                <div className="flex items-center text-parchment-dark">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{post.replyCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-parchment-dark mx-auto mb-2 opacity-50" />
                      <p className="text-parchment-dark">Nenhuma publicação encontrada</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Selected post and replies */}
          <div className="md:col-span-2">
            <Card className="bg-dark-light border-primary h-full">
              {selectedPost ? (
                <>
                  {/* Selected post details */}
                  {forumPosts.map((post: any) => post.id === selectedPost && (
                    <div key={post.id}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar user={post.user} size="medium" />
                          <div className="flex-1">
                            <CardTitle className="font-cinzel text-xl">{post.title}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {post.pathId && (
                                <Badge variant="outline" className="border-primary">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {learningPaths.find((p: any) => p.id === post.pathId)?.title || 'Trilha'}
                                </Badge>
                              )}
                              {post.missionId && (
                                <Badge variant="outline" className="border-primary">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {missions.find((m: any) => m.id === post.missionId)?.title || 'Missão'}
                                </Badge>
                              )}
                              {post.area && getAreaBadge(post.area)}
                            </div>
                            <CardDescription className="mt-2">
                              Publicado por {post.user?.username || 'Anônimo'} • {formatDate(post.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="p-4 bg-dark rounded-lg border border-primary mb-6">
                          <p className="text-parchment whitespace-pre-line">{post.content}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-cinzel text-lg text-accent">Respostas</h3>
                          <Separator className="my-2 bg-primary opacity-50" />
                        </div>
                        
                        <ScrollArea className="h-[calc(100vh-500px)]">
                          {repliesLoading ? (
                            <div className="py-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent mx-auto"></div>
                              <p className="mt-2 text-parchment-dark">Carregando respostas...</p>
                            </div>
                          ) : postReplies.length > 0 ? (
                            <div className="space-y-4">
                              {postReplies.map((reply: any) => (
                                <div key={reply.id} className="flex gap-4">
                                  <Avatar user={reply.user} size="small" />
                                  <div className="flex-1 p-3 bg-dark rounded-lg border border-primary">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">{reply.user?.username || 'Anônimo'}</span>
                                      <span className="text-xs text-parchment-dark">{formatDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-parchment">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-6 text-center">
                              <MessageCircle className="h-10 w-10 text-parchment-dark mx-auto mb-2 opacity-50" />
                              <p className="text-parchment-dark">Nenhuma resposta ainda. Seja o primeiro a responder!</p>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                      
                      <CardFooter>
                        <form 
                          onSubmit={replyForm.handleSubmit(onCreateReply)} 
                          className="w-full flex flex-col gap-2"
                        >
                          <div className="flex gap-4 w-full">
                            <Avatar user={user} size="small" />
                            <div className="flex-1 relative">
                              <Textarea
                                placeholder="Escreva sua resposta..."
                                className="pr-12 bg-dark border-primary text-parchment min-h-[80px]"
                                {...replyForm.register('content')}
                              />
                              <Button
                                type="submit"
                                size="icon"
                                className="absolute bottom-2 right-2 bg-accent hover:bg-accent-dark text-dark h-8 w-8"
                                disabled={createReplyMutation.isPending}
                              >
                                {createReplyMutation.isPending ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {replyForm.formState.errors.content && (
                            <p className="text-red-500 text-xs ml-12">
                              {replyForm.formState.errors.content.message}
                            </p>
                          )}
                        </form>
                      </CardFooter>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <MessageSquare className="h-16 w-16 text-primary-light opacity-30 mb-4" />
                  <h2 className="text-xl font-medieval text-accent mb-2">Nenhuma publicação selecionada</h2>
                  <p className="text-parchment-dark text-center max-w-md">
                    Selecione uma publicação da lista para ver os detalhes e respostas,
                    ou crie uma nova publicação para iniciar uma discussão.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
