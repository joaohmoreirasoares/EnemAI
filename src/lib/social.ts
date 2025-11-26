import { supabase } from '@/integrations/supabase/client';

export async function openOrCreateConversation(userA: string, userB: string): Promise<string> {
  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .in('user_id', [userA, userB])
    .limit(1);

  if (existingConversation && existingConversation.length > 0) {
    return existingConversation[0].conversation_id;
  }

  // Create new conversation
  const { data: newConversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (conversationError || !newConversation) {
    throw new Error('Failed to create conversation');
  }

  // Add participants
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, user_id: userA },
      { conversation_id: newConversation.id, user_id: userB }
    ]);

  if (participantsError) {
    throw new Error('Failed to add participants');
  }

  return newConversation.id;
}

export async function createPost({
  author_id,
  title,
  body,
  tags = []
}: {
  author_id: string;
  title: string;
  body?: string;
  tags?: string[];
}) {
  // Create the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id,
      title,
      body
    })
    .select()
    .single();

  if (postError || !post) {
    throw new Error('Failed to create post');
  }

  // Add tags if provided
  if (tags.length > 0) {
    // Get or create tag IDs
    const tagIds: number[] = [];
    for (const tagName of tags) {
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single();

      if (!tag) {
        // Create new tag
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select()
          .single();

        if (tagError || !newTag) {
          throw new Error(`Failed to create tag: ${tagName}`);
        }
        tagIds.push(newTag.id);
      } else {
        tagIds.push(tag.id);
      }
    }

    // Link post to tags
    const { error: postTagsError } = await supabase
      .from('post_tags')
      .insert(
        tagIds.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }))
      );

    if (postTagsError) {
      throw new Error('Failed to add tags to post');
    }
  }

  return post;
}

export async function createComment({
  post_id,
  discussion_id,
  author_id,
  body,
  parent_comment_id
}: {
  post_id?: string;
  discussion_id?: string;
  author_id: string;
  body: string;
  parent_comment_id?: string;
}) {
  if (!post_id && !discussion_id) {
    throw new Error('Either post_id or discussion_id must be provided');
  }

  const payload: any = {
    user_id: author_id,
    content: body,
    parent_comment_id
  };

  if (post_id) payload.post_id = post_id;
  if (discussion_id) payload.discussion_id = discussion_id;

  const { data: comment, error } = await supabase
    .from('comments')
    .insert(payload)
    .select()
    .single();

  if (error || !comment) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }

  return comment;
}

export async function sendMessage({
  conversation_id,
  sender_id,
  body
}: {
  conversation_id: string;
  sender_id: string;
  body: string;
}) {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id,
      body
    })
    .select()
    .single();

  if (error || !message) {
    throw new Error('Failed to send message');
  }

  // Update conversation last message time
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversation_id);

  return message;
}

export async function getPosts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (first_name, last_name, avatar_url),
      post_tags (tag_id),
      tags (name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error('Failed to fetch posts');
  }

  return data;
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (first_name, last_name, avatar_url),
      post_tags (tag_id),
      tags (name)
    `)
    .eq('id', postId)
    .single();

  if (error) {
    throw new Error('Failed to fetch post');
  }

  return data;
}

export async function getComments({
  postId,
  discussionId
}: {
  postId?: string;
  discussionId?: string;
}) {
  if (!postId && !discussionId) {
    throw new Error('Either postId or discussionId must be provided');
  }

  let query = supabase
    .from('comments')
    .select(`
      *,
      profiles (
        id,
        name,
        avatar_url
      ),
      parent_comment_id
    `)
    .order('created_at', { ascending: true });

  if (postId) {
    query = query.eq('post_id', postId);
  }
  if (discussionId) {
    query = query.eq('discussion_id', discussionId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch comments');
  }

  return data;
}

export async function getConversationById(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants (
        user_id,
        profiles (first_name, last_name, avatar_url)
      ),
      messages (
        *,
        sender: profiles (first_name, last_name, avatar_url)
      )
    `)
    .eq('id', conversationId)
    .single();

  if (error) {
    throw new Error('Failed to fetch conversation');
  }

  return data;
}