const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://bwtcquzpxgkrositnyrj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dGNxdXpweGdrcm9zaXRueXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTI5NTksImV4cCI6MjA0OTc2ODk1OX0.UYjPNnhS250d31KcmGfs6OJtpuwjaxbd3bebeOZJw9o');

module.exports = supabase;
