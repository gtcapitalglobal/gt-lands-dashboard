/**
 * GT Lands Dashboard - Cloudflare Worker
 * Backend seguro para proteger API keys
 * 
 * Endpoints:
 * - POST /api/google-maps - Proxy para Google Maps API
 * - POST /api/openai - Proxy para OpenAI API
 * - POST /api/gemini - Proxy para Google Gemini API
 * - POST /api/perplexity - Proxy para Perplexity API
 * - POST /api/zillow - Proxy para Zillow API (RapidAPI)
 * - POST /api/realtor - Proxy para Realtor.com API (RapidAPI)
 * - POST /api/realty-mole - Proxy para Realty Mole API
 */

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Google Maps API Proxy
      if (path === '/api/google-maps') {
        const { endpoint, params } = await request.json();
        
        const mapsUrl = new URL(endpoint);
        mapsUrl.searchParams.append('key', env.GOOGLE_MAPS_API_KEY);
        
        // Adicionar parâmetros adicionais
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            mapsUrl.searchParams.append(key, value);
          });
        }

        const response = await fetch(mapsUrl.toString());
        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // OpenAI API Proxy
      if (path === '/api/openai') {
        const { messages, model = 'gpt-4', max_tokens = 1000 } = await request.json();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
          }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Google Gemini API Proxy
      if (path === '/api/gemini') {
        const { prompt, model = 'gemini-pro' } = await request.json();

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            }),
          }
        );

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Perplexity API Proxy
      if (path === '/api/perplexity') {
        const { messages, model = 'llama-3.1-sonar-small-128k-online' } = await request.json();

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
          }),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Zillow API Proxy (RapidAPI)
      if (path === '/api/zillow') {
        const { endpoint, params } = await request.json();

        const zillowUrl = new URL(`https://zillow-com1.p.rapidapi.com${endpoint}`);
        
        // Adicionar parâmetros
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            zillowUrl.searchParams.append(key, value);
          });
        }

        const response = await fetch(zillowUrl.toString(), {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
          },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Realtor.com API Proxy (RapidAPI)
      if (path === '/api/realtor') {
        const { endpoint, params } = await request.json();

        const realtorUrl = new URL(`https://realtor.p.rapidapi.com${endpoint}`);
        
        // Adicionar parâmetros
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            realtorUrl.searchParams.append(key, value);
          });
        }

        const response = await fetch(realtorUrl.toString(), {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'realtor.p.rapidapi.com',
          },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Realty Mole API Proxy
      if (path === '/api/realty-mole') {
        const { endpoint, params } = await request.json();

        const realtyMoleUrl = new URL(`https://realty-mole-property-api.p.rapidapi.com${endpoint}`);
        
        // Adicionar parâmetros
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            realtyMoleUrl.searchParams.append(key, value);
          });
        }

        const response = await fetch(realtyMoleUrl.toString(), {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com',
          },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 404 Not Found
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

