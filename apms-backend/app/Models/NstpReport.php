<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NstpReport extends Model
{
    protected $fillable = [
        'submitted_by',
        'barangay_name',
        'activity_title',
        'activity_date',
        'participants',
        'student_volunteers',
        'hours_rendered',
        'description',
        'status',
        'rejection_reason',
        'approved_by',
        'approved_at',
    ];

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}