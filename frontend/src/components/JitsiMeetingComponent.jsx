import React, { useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const JitsiMeetingComponent = ({ roomName, userName }) => {
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  return (
    <div className="w-full h-full min-h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col justify-center items-center relative">
      {!isMeetingActive ? (
        <div className="text-center p-6">
          <div className="mb-4 text-white text-xl font-medium">Ready to join the live session?</div>
          <button 
            onClick={() => setIsMeetingActive(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Join Meeting Now
          </button>
        </div>
      ) : (
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: userName
          }}
          onApiReady={(externalApi) => {
            // here you can attach custom event listeners to the Jitsi Meet External API
            // you can also store it locally to execute commands
          }}
          getIFrameRef={(iframeRef) => { iframeRef.style.height = '600px'; }}
        />
      )}
    </div>
  );
};

export default JitsiMeetingComponent;
