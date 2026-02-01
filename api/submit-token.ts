import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      token_address,
      token_name,
      symbol,
      description,
      twitter,
      telegram,
      website,
      image_url,
      contact_email,
      rush_processing
    } = req.body;

    // Validate required fields
    if (!token_address) {
      return res.status(400).json({ error: 'Token address is required' });
    }

    // Insert submission
    const { data, error } = await supabase
      .from('token_submissions')
      .insert({
        token_address,
        token_name,
        symbol,
        description,
        twitter,
        telegram,
        website,
        image_url,
        contact_email,
        rush_processing: rush_processing || false,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ 
      success: true, 
      message: 'Token submitted successfully',
      id: data.id 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Failed to submit token' });
  }
}
