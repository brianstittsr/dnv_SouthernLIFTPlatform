import { NextRequest, NextResponse } from 'next/server';
import { MailChimpClient } from '@/lib/mailchimp';

const mailchimp = new MailChimpClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const listId = searchParams.get('listId');

  try {
    switch (action) {
      case 'ping':
        const pingResult = await mailchimp.ping();
        return NextResponse.json(pingResult);

      case 'account':
        const accountInfo = await mailchimp.getAccountInfo();
        return NextResponse.json(accountInfo);

      case 'lists':
        const lists = await mailchimp.getLists();
        return NextResponse.json(lists);

      case 'list':
        if (!listId) {
          return NextResponse.json({ error: 'listId is required' }, { status: 400 });
        }
        const list = await mailchimp.getList(listId);
        return NextResponse.json(list);

      case 'members':
        if (!listId) {
          return NextResponse.json({ error: 'listId is required' }, { status: 400 });
        }
        const count = parseInt(searchParams.get('count') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;
        const members = await mailchimp.getMembers(listId, { count, offset, status });
        return NextResponse.json(members);

      case 'campaigns':
        const campaignCount = parseInt(searchParams.get('count') || '50');
        const campaignOffset = parseInt(searchParams.get('offset') || '0');
        const campaignStatus = searchParams.get('status') || undefined;
        const campaigns = await mailchimp.getCampaigns({ 
          count: campaignCount, 
          offset: campaignOffset, 
          status: campaignStatus 
        });
        return NextResponse.json(campaigns);

      case 'tags':
        if (!listId) {
          return NextResponse.json({ error: 'listId is required' }, { status: 400 });
        }
        const tags = await mailchimp.getTags(listId);
        return NextResponse.json(tags);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MailChimp API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'subscribe':
        if (!body.listId || !body.email) {
          return NextResponse.json(
            { error: 'listId and email are required' },
            { status: 400 }
          );
        }
        const subscriber = await mailchimp.addSubscriber(body.listId, {
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          company: body.company,
          tags: body.tags,
          status: body.status || 'subscribed',
        });
        return NextResponse.json(subscriber);

      case 'unsubscribe':
        if (!body.listId || !body.email) {
          return NextResponse.json(
            { error: 'listId and email are required' },
            { status: 400 }
          );
        }
        const hash = MailChimpClient.getSubscriberHash(body.email);
        await mailchimp.updateSubscriber(body.listId, hash, { status: 'unsubscribed' as const });
        return NextResponse.json({ success: true });

      case 'addTags':
        if (!body.listId || !body.email || !body.tags) {
          return NextResponse.json(
            { error: 'listId, email, and tags are required' },
            { status: 400 }
          );
        }
        const tagHash = MailChimpClient.getSubscriberHash(body.email);
        await mailchimp.addTagsToSubscriber(body.listId, tagHash, body.tags);
        return NextResponse.json({ success: true });

      case 'createCampaign':
        if (!body.listId || !body.subject || !body.title || !body.fromName || !body.replyTo) {
          return NextResponse.json(
            { error: 'listId, subject, title, fromName, and replyTo are required' },
            { status: 400 }
          );
        }
        const campaign = await mailchimp.createCampaign({
          type: body.type || 'regular',
          recipients: { list_id: body.listId },
          settings: {
            subject_line: body.subject,
            preview_text: body.previewText,
            title: body.title,
            from_name: body.fromName,
            reply_to: body.replyTo,
          },
        });
        return NextResponse.json(campaign);

      case 'sendCampaign':
        if (!body.campaignId) {
          return NextResponse.json(
            { error: 'campaignId is required' },
            { status: 400 }
          );
        }
        await mailchimp.sendCampaign(body.campaignId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MailChimp API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
