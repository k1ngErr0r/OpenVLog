import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useApiWithToasts } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

interface Comment {
  id: string;
  vulnerability_id: number;
  user_id: number;
  username?: string;
  body: string;
  created_at: string;
}

export function CommentThread({ vulnerabilityId }: { vulnerabilityId: number }) {
  const api = useApiWithToasts();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const toast = useToast().push;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/vulnerabilities/${vulnerabilityId}/comments`);
      setComments(res.data);
    } catch (e) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [vulnerabilityId]);

  const submit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      vulnerability_id: vulnerabilityId,
      user_id: 0,
      body: body.trim(),
      created_at: new Date().toISOString(),
    };
    setComments(prev => [optimistic, ...prev]);
    const toSend = body.trim();
    setBody('');
    try {
      const res = await api.post(`/api/vulnerabilities/${vulnerabilityId}/comments`, { body: toSend });
      // replace optimistic with real
      setComments(prev => [res.data, ...prev.filter(c => c.id !== optimistic.id)]);
    } catch (e) {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      setBody(toSend); // restore text
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="comment-body">Add Comment</label>
        <Textarea id="comment-body" value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Share context or remediation notes" />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={submit} disabled={posting || !body.trim()}>{posting ? 'Posting...' : 'Post'}</Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Comments list">
          {comments.map(c => (
            <li key={c.id} className="rounded border p-3 bg-white/50 dark:bg-gray-900/40">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{c.username || 'User #' + c.user_id}</span>
                <time dateTime={c.created_at}>{new Date(c.created_at).toLocaleString()}</time>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
