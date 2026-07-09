<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccreditationStatus extends Model
{
    protected $table = 'accreditation_status';

    protected $fillable = [
        'school_id',
        'program_id',
        'accrediting_body',
        'level',
        'date_accredited',
        'expiry_date',
        'status',
        'notes',
        'rejection_reason',
        'submitted_by',
        'approved_by',
        'approved_at',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}