using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables.Groups
{
    public class Conversation
    {
        public uint ConversationId { get; set; }
        public User User1 { get; set; }
        public User User2 { get; set; }

        internal List<Message> Messages { get; set; }    
    }
}
